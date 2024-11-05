import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
}

export function configureRabbitmq({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
}: Props) {
  const rabbitmqServiceDiscovery = new aws.servicediscovery.Service(
    `rabbitmq-service-discovery-${stack}`,
    {
      name: 'rabbitmq',
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
  const rabbitmqRepository = new awsx.ecr.Repository('rabbitmq-service');

  const rabbitmqImage = new awsx.ecr.Image('rabbitmq-service', {
    platform: 'linux/amd64',
    context: '../../infra/rabbitmq',
    dockerfile: '../../infra/rabbitmq/Dockerfile',
    repositoryUrl: rabbitmqRepository.url,
  });
  const rabbitmqService = new awsx.ecs.FargateService('rabbitmq-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `rabbitmq-${stack}`,
        image: rabbitmqImage.imageUri,
        cpu: 512,
        memory: 512,
        portMappings: [{ containerPort: 5672, hostPort: 5672 }],
        environment: [
          { name: 'RABBITMQ_DEFAULT_USER', value: 'guest' },
          { name: 'RABBITMQ_DEFAULT_PASS', value: 'guest' },
        ],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    serviceRegistries: {
      registryArn: rabbitmqServiceDiscovery.arn,
    },
    desiredCount: 1,
  });
  return rabbitmqService;
}
