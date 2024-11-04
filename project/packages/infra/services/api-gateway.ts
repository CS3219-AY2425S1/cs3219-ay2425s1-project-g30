import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
  targetGroup: aws.lb.TargetGroup;
}

export function configureApi({
  stack,
  vpc,
  cluster,
  securityGroup,
  targetGroup,
}: Props) {
  const apiRepository = new awsx.ecr.Repository("api-gateway");

  const apiImage = new awsx.ecr.Image("api-gateway", {
    platform: "linux/amd64",
    context: "../../../",
    dockerfile: "../../../apps/api-gateway/Dockerfile",
    repositoryUrl: apiRepository.url,
  });

  const apiService = new awsx.ecs.FargateService("api-service", {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `api-${stack}`,
        image: apiImage.imageUri,
        cpu: 128,
        memory: 256,
        portMappings: [{ containerPort: 4000, hostPort: 4000 }],
        environment: [
          {
            name: "QUESTION_SERVICE_HOST",
            value: "question.service",
          },
          {
            name: "USER_SERVICE_HOST",
            value: "user.service",
          },
          {
            name: "AUTH_SERVICE_HOST",
            value: "auth.service",
          },
          {
            name: "MATCHING_SERVICE_HOST",
            value: "matching.service",
          },
          {
            name: "COLLABORATION_SERVICE_HOST",
            value: "collaboration.service",
          },
          {
            name: "NODE_ENV",
            value: "production",
          },
        ],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    loadBalancers: [
      {
        containerPort: 4000,
        targetGroupArn: targetGroup.arn,
        containerName: "api-gateway",
      },
    ],
    desiredCount: 1,
  });
  return apiService;
}
