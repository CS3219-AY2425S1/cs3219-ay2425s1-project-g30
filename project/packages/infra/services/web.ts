import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  dnsName: pulumi.Output<string>;
  targetGroup: aws.lb.TargetGroup;
}

export function configureWeb({
  stack,
  vpc,
  cluster,
  securityGroup,
  dnsName,
  targetGroup,
}: Props) {
  const webRepository = new awsx.ecr.Repository('web');

  const webImage = new awsx.ecr.Image('web', {
    platform: 'linux/amd64',
    context: '../../',
    dockerfile: '../../apps/web/Dockerfile',
    repositoryUrl: webRepository.url,
    args: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_BASE_URL: pulumi.interpolate`http://${dnsName}/api`,
      NEXT_PUBLIC_MATCH_SOCKET_URL: pulumi.interpolate`http://${dnsName}`,
      NEXT_PUBLIC_COLLAB_SOCKET_URL: pulumi.interpolate`http://${dnsName}/collaboration-service`,
    },
  });

  const webService = new awsx.ecs.FargateService('web-service', {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `web-${stack}`,
        image: webImage.imageUri,
        cpu: 1024,
        memory: 1024,
        portMappings: [{ containerPort: 3000, hostPort: 3000 }],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    loadBalancers: [
      {
        containerName: `web-${stack}`,
        containerPort: 3000,
        targetGroupArn: targetGroup.arn,
      },
    ],
    desiredCount: 1,
  });
  return webService;
}
