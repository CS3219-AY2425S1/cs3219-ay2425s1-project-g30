import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
}

export function configureAuth({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
}: Props) {
  const authServiceDiscovery = new aws.servicediscovery.Service(
    `auth-service-discovery-${stack}`,
    {
      name: 'auth',
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
  const authRepository = new awsx.ecr.Repository('auth-service');

  const authImage = new awsx.ecr.Image('auth-service', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/auth-service/Dockerfile',
    repositoryUrl: authRepository.url,
  });
  const authService = new awsx.ecs.FargateService('auth-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `auth-${stack}`,
        image: authImage.imageUri,
        cpu: 1024,
        memory: 1024,
        portMappings: [{ containerPort: 3003, hostPort: 3003 }],
        environment: [
          {
            name: 'AUTH_SERVICE_HOST',
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
      registryArn: authServiceDiscovery.arn,
    },
    desiredCount: 1,
  });
  return authService;
}
