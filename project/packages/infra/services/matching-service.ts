import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
  targetGroup: aws.lb.TargetGroup;
}

export function configureMatching({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
  targetGroup,
}: Props) {
  const matchingServiceDiscovery = new aws.servicediscovery.Service(
    `matching-service-discovery-${stack}`,
    {
      name: 'matching',
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
  const matchingRepository = new awsx.ecr.Repository('matching-service');

  const matchingImage = new awsx.ecr.Image('matching-service', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/matching-service/Dockerfile',
    repositoryUrl: matchingRepository.url,
  });
  const matchingService = new awsx.ecs.FargateService('matching-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `matching-${stack}`,
        image: matchingImage.imageUri,
        cpu: 1024,
        memory: 1024,
        portMappings: [
          { containerPort: 3004, hostPort: 3004 },
          { containerPort: 8080, hostPort: 8080 },
        ],
        environment: [
          {
            name: 'MATCHING_SERVICE_HOST',
            value: '0.0.0.0',
          },
          {
            name: 'QUESTION_SERVICE_HOST',
            value: 'question.service',
          },
          {
            name: 'AUTH_SERVICE_HOST',
            value: 'auth.service',
          },
          {
            name: 'COLLABORATION_SERVICE_HOST',
            value: 'collaboration.service',
          },
          {
            name: 'SUPABASE_URL',
            value: process.env.MATCHING_SERVICE_SUPABASE_URL,
          },
          {
            name: 'SUPABASE_KEY',
            value: process.env.MATCHING_SERVICE_SUPABASE_KEY,
          },
          {
            name: 'RABBITMQ_URL',
            value: 'amqp://rabbitq.service:5672',
          },
          {
            name: 'REDIS_HOST',
            value: 'redis.service',
          },
          {
            name: 'REDIS_PORT',
            value: '6379',
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
      registryArn: matchingServiceDiscovery.arn,
    },
    loadBalancers: [
      {
        containerPort: 8080,
        targetGroupArn: targetGroup.arn,
        containerName: `matching-${stack}`,
      },
    ],
    desiredCount: 1,
  });
  return matchingService;
}
