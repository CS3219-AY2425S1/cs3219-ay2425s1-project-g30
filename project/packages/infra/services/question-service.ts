import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  namespace: aws.servicediscovery.PrivateDnsNamespace;
}

export function configureQuestion({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
}: Props) {
  const questionServiceDiscovery = new aws.servicediscovery.Service(
    `question-service-discovery-${stack}`,
    {
      name: 'question',
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
  const questionRepository = new awsx.ecr.Repository('question-service');

  const questionImage = new awsx.ecr.Image('question-service', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/question-service/Dockerfile',
    repositoryUrl: questionRepository.url,
  });
  const questionService = new awsx.ecs.FargateService('question-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `question-${stack}`,
        image: questionImage.imageUri,
        cpu: 1024,
        memory: 1024,
        portMappings: [{ containerPort: 3001, hostPort: 3001 }],
        environment: [
          {
            name: 'QUESTION_SERVICE_HOST',
            value: '0.0.0.0',
          },
          {
            name: 'SUPABASE_URL',
            value: process.env.QUESTION_SERVICE_SUPABASE_URL,
          },
          {
            name: 'SUPABASE_KEY',
            value: process.env.QUESTION_SERVICE_SUPABASE_KEY,
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
      registryArn: questionServiceDiscovery.arn,
    },
    desiredCount: 1,
  });
  return questionService;
}
