import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

interface Props {
  stack: string;
}

export function configureNetwork({ stack }: Props) {
  const vpc = new awsx.ec2.Vpc(`vpc-${stack}`, {
    cidrBlock: "10.0.0.0/16",
    numberOfAvailabilityZones: 2,
    enableDnsHostnames: true,
  });

  const securityGroup = new aws.ec2.SecurityGroup(`security-${stack}`, {
    vpcId: vpc.vpcId,
    ingress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
      { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
  });

  const lb = new awsx.lb.ApplicationLoadBalancer(`lb-${stack}`, {
    subnetIds: vpc.publicSubnetIds,
    securityGroups: [securityGroup.id],
    listener: {
      port: 80,
      protocol: "HTTP",
    },
  });

  return { vpc, securityGroup, lb };
}

interface ConfigureListenerProps {
  lb: awsx.lb.ApplicationLoadBalancer;
  vpc: awsx.ec2.Vpc;
}

export function configureListener({ lb, vpc }: ConfigureListenerProps) {
  const webTargetGroup = new aws.lb.TargetGroup("web", {
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.vpcId,
  });
  const apiTargetGroup = new aws.lb.TargetGroup("api-gateway", {
    targetType: "ip",
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.vpcId,
  });
  const listener = new aws.lb.Listener("lastminprep", {
    loadBalancerArn: lb.loadBalancer.arn,
    defaultActions: [{ type: "forward", targetGroupArn: webTargetGroup.arn }],
  });

  new aws.lb.ListenerRule("api", {
    listenerArn: listener.arn,
    actions: [{ type: "forward", targetGroupArn: apiTargetGroup.arn }],
    conditions: [
      {
        pathPattern: {
          values: ["/api/*"],
        },
      },
    ],
  });

  return { webTargetGroup, apiTargetGroup };
}
