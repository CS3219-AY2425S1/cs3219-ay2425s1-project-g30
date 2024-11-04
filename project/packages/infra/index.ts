import * as pulumi from "@pulumi/pulumi";

import { configureListener, configureNetwork } from "./network";
import {
  configureApi,
  configureAuth,
  configureServices,
  configureWeb,
} from "./services";

const stack = pulumi.getStack();

const { vpc, securityGroup, lb } = configureNetwork({ stack });
const { cluster, namespace } = configureServices({ stack, vpc });
const { webTargetGroup, apiTargetGroup } = configureListener({ lb, vpc });
const dnsName = lb.loadBalancer.dnsName;

// Setup images, task definitions and services
const apiService = configureApi({
  stack,
  vpc,
  cluster,
  securityGroup,
  targetGroup: apiTargetGroup,
});
const webService = configureWeb({
  stack,
  vpc,
  cluster,
  securityGroup,
  dnsName,
  targetGroup: webTargetGroup,
});
const authService = configureAuth({ stack, vpc, cluster, securityGroup });

// Attach Listeners

export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;
export const defaultSecurityGroupId = vpc.vpc.defaultSecurityGroupId;
export const defaultTargetGroupId = lb.defaultTargetGroup.id;
export const url = pulumi.interpolate`http://${lb.loadBalancer.dnsName}`;
