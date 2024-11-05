import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
}

export function configureUser({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
}: Props) {
  const userServiceDiscovery = new aws.servicediscovery.Service(
    `user-service-discovery-${stack}`,
    {
      name: 'user',
      dnsConfig: {
        namespaceId: namespace.id,
        dnsRecords: [
          {
            ttl: 10,
            type: 'A',
          },
        ],
      },
      healthCheckCustomConfig: {
        failureThreshold: 1,
      },
    },
  );
  const userRepository = new awsx.ecr.Repository('user-service');

  const userImage = new awsx.ecr.Image('user-service', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/user-service/Dockerfile',
    repositoryUrl: userRepository.url,
  });
  const userService = new awsx.ecs.FargateService('user-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `user-${stack}`,
        image: userImage.imageUri,
        cpu: 1024,
        memory: 1024,
        portMappings: [{ containerPort: 3002, hostPort: 3002 }],
        environment: [
          {
            name: 'USER_SERVICE_HOST',
            value: '0.0.0.0',
          },
          {
            name: 'SUPABASE_URL',
            value: process.env.USER_SERVICE_SUPABASE_URL,
          },
          {
            name: 'SUPABASE_KEY',
            value: process.env.USER_SERVICE_SUPABASE_KEY,
          },
          { name: 'NODE_ENV', value: 'production' },
        ],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    serviceRegistries: {
      registryArn: userServiceDiscovery.arn,
    },
    desiredCount: 1,
  });
  return userService;
}
