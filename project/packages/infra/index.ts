import * as pulumi from '@pulumi/pulumi';
import * as dotenv from 'dotenv';

dotenv.config();

import { configureNetwork } from './network';
import {
  configureApi,
  configureAuth,
  configureServices,
  configureWeb,
} from './services';
import { configureCollaboration } from './services/collaboration-service';
import { configureMatching } from './services/matching-service';
import { configureQuestion } from './services/question-service';
import { configureRabbitmq } from './services/rabbitmq-service';
import { configureRedis } from './services/redis';
import { configureUser } from './services/user-service';

const stack = pulumi.getStack();

const {
  vpc,
  securityGroup,
  lb,
  apiTargetGroup,
  webTargetGroup,
  matchingTargetGroup,
  collaborationTargetGroup,
} = configureNetwork({ stack });
const { cluster, namespace } = configureServices({ stack, vpc });

// Setup images, task definitions and services
configureApi({
  stack,
  vpc,
  cluster,
  securityGroup,
  targetGroup: apiTargetGroup,
});
configureWeb({
  stack,
  vpc,
  cluster,
  securityGroup,
  targetGroup: webTargetGroup,
});
configureAuth({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
});

configureQuestion({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
});

configureUser({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
});

configureRabbitmq({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
});

configureRedis({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
});

configureMatching({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
  targetGroup: matchingTargetGroup,
});

configureCollaboration({
  stack,
  vpc,
  cluster,
  securityGroup,
  namespace,
  targetGroup: collaborationTargetGroup,
});

export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
export const defaultSecurityGroupId = vpc.vpc.defaultSecurityGroupId;
export const defaultTargetGroupId = lb.defaultTargetGroup.id;
export const url = pulumi.interpolate`http://${lb.loadBalancer.dnsName}`;
