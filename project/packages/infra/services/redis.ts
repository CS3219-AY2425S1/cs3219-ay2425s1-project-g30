import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
}

export function configureRedis({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
}: Props) {
  const redisServiceDiscovery = new aws.servicediscovery.Service(
    `redis-service-discovery-${stack}`,
    {
      name: 'redis',
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

  const redisService = new awsx.ecs.FargateService('redis-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `redis-${stack}`,
        image: 'redis:latest',
        cpu: 512,
        memory: 512,
        portMappings: [{ containerPort: 6379, hostPort: 6379 }],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    serviceRegistries: {
      registryArn: redisServiceDiscovery.arn,
    },
    desiredCount: 1,
  });
  return redisService;
}
