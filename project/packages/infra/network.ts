import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

interface Props {
  stack: string;
}

export function configureNetwork({ stack }: Props) {
  const vpc = new awsx.ec2.Vpc(`vpc-${stack}`, {
    cidrBlock: '10.0.0.0/16',
    numberOfAvailabilityZones: 2,
    enableDnsHostnames: true,
  });

  const securityGroup = new aws.ec2.SecurityGroup(`security-${stack}`, {
    vpcId: vpc.vpcId,
    ingress: [
      { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
    ],
    egress: [
      { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
    ],
  });

  const webTargetGroup = new aws.lb.TargetGroup('web', {
    targetType: 'ip',
    port: 80,
    protocol: 'HTTP',
    vpcId: vpc.vpcId,
  });

  const lb = new awsx.lb.ApplicationLoadBalancer(`lb-${stack}`, {
    subnetIds: vpc.publicSubnetIds,
    securityGroups: [securityGroup.id],
    listener: {
      defaultActions: [{ type: 'forward', targetGroupArn: webTargetGroup.arn }],
      port: 80,
      protocol: 'HTTP',
    },
  });
  const apiTargetGroup = new aws.lb.TargetGroup('api-gateway', {
    targetType: 'ip',
    port: 80,
    protocol: 'HTTP',
    vpcId: vpc.vpcId,
    healthCheck: {
      path: '/api/health',
      protocol: 'HTTP',
    },
  });
  const matchingTargetGroup = new aws.lb.TargetGroup('matching-service', {
    targetType: 'ip',
    port: 80,
    protocol: 'HTTP',
    vpcId: vpc.vpcId,
    healthCheck: {
      path: '/health',
      protocol: 'HTTP',
    },
  });

  const collaborationTargetGroup = new aws.lb.TargetGroup(
    'collaboration-service',
    {
      targetType: 'ip',
      port: 80,
      protocol: 'HTTP',
      vpcId: vpc.vpcId,
      healthCheck: {
        path: '/',
        protocol: 'HTTP',
      },
    },
  );
  lb.loadBalancer.arn.apply(async (arn) => {
    const listener = await aws.lb.getListener({
      loadBalancerArn: arn,
      port: 80,
    });
    new aws.lb.ListenerRule('api', {
      listenerArn: listener.arn,
      actions: [{ type: 'forward', targetGroupArn: apiTargetGroup.arn }],
      priority: 3,
      conditions: [
        {
          pathPattern: {
            values: ['/api/*'],
          },
        },
      ],
    });
    new aws.lb.ListenerRule('matching', {
      listenerArn: listener.arn,
      actions: [{ type: 'forward', targetGroupArn: matchingTargetGroup.arn }],
      priority: 1,
      conditions: [
        {
          pathPattern: {
            values: ['/matching-service/*'],
          },
        },
      ],
    });
    new aws.lb.ListenerRule('collaboration', {
      listenerArn: listener.arn,
      actions: [
        { type: 'forward', targetGroupArn: collaborationTargetGroup.arn },
      ],
      priority: 2,
      conditions: [
        {
          pathPattern: {
            values: ['/collaboration-service*'],
          },
        },
      ],
    });
  });

  return {
    vpc,
    securityGroup,
    lb,
    apiTargetGroup,
    webTargetGroup,
    matchingTargetGroup,
    collaborationTargetGroup,
  };
}
