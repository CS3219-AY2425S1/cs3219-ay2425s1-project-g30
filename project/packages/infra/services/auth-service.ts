import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

interface Props {
  stack: string;
  vpc: awsx.ec2.Vpc;
  cluster: aws.ecs.Cluster;
  securityGroup: aws.ec2.SecurityGroup;
}

export function configureAuth({ stack, vpc, cluster, securityGroup }: Props) {
  const authRepository = new awsx.ecr.Repository("auth-service");

  const authImage = new awsx.ecr.Image("auth-service", {
    platform: "linux/amd64",
    context: "../../../",
    dockerfile: "../../../apps/auth-service/Dockerfile",
    repositoryUrl: authRepository.url,
  });
  const authService = new awsx.ecs.FargateService("auth-service", {
    cluster: cluster.arn,
    taskDefinitionArgs: {
      container: {
        name: `auth-${stack}`,
        image: authImage.imageUri,
        cpu: 128,
        memory: 256,
        portMappings: [{ containerPort: 3003, hostPort: 3003 }],
        environment: [
          {
            name: "AUTH_SERVICE_HOST",
            value: "0.0.0.0",
          },
          {
            name: "SUPABASE_URL",
            value: "https://kamxbsekjfdzemvoevgz.supabase.co",
          },
          {
            name: "SUPABASE_KEY",
            value:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbXhic2VramZkemVtdm9ldmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzIzMjI1MiwiZXhwIjoyMDQyODA4MjUyfQ.NU9ztj3oZXuq8faZvTsztiIJa9OJZj9v0r-MkqNglic",
          },
          { name: "NODE_ENV", value: "production" },
        ],
      },
    },
    networkConfiguration: {
      subnets: vpc.publicSubnetIds,
      securityGroups: [securityGroup.id],
      assignPublicIp: true,
    },
    desiredCount: 1,
  });
  return authService;
}
