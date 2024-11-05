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

export function configureCollaboration({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
  targetGroup,
}: Props) {
  const collaborationServiceDiscovery = new aws.servicediscovery.Service(
    `collaboration-service-discovery-${stack}`,
    {
      name: 'collaboration',
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
  const collaborationRepository = new awsx.ecr.Repository(
    'collaboration-service',
  );

  const collaborationImage = new awsx.ecr.Image('collaboration-service', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/collaboration-service/Dockerfile',
    repositoryUrl: collaborationRepository.url,
  });
  const collaborationService = new awsx.ecs.FargateService(
    'collaboration-service',
    {
      cluster: cluster.arn,
      taskDefinitionArgs: {
        container: {
          name: `collaboration-${stack}`,
          image: collaborationImage.imageUri,
          cpu: 1024,
          memory: 1024,
          portMappings: [
            { containerPort: 3005, hostPort: 3005 },
            { containerPort: 1234, hostPort: 1234 },
          ],
          environment: [
            {
              name: 'COLLABORATION_SERVICE_HOST',
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
            { name: 'HOCUSPOCUS_PORT', value: '1234' },
            {
              name: 'SUPABASE_URL',
              value: process.env.COLLABORATION_SERVICE_SUPABASE_URL,
            },
            {
              name: 'SUPABASE_KEY',
              value: process.env.COLLABORATION_SERVICE_SUPABASE_KEY,
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
        registryArn: collaborationServiceDiscovery.arn,
      },
      loadBalancers: [
        {
          containerPort: 1234,
          targetGroupArn: targetGroup.arn,
          containerName: `collaboration-${stack}`,
        },
      ],
      desiredCount: 1,
    },
  );
  return collaborationService;
}
