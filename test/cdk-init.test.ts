import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as CdkInit from '../lib/cdk-init-stack';

test('VPC is configured with required CIDR and NAT gateway count', () => {
  const app = new cdk.App();
  const stack = new CdkInit.CdkInitStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
  });
  template.resourceCountIs('AWS::EC2::NatGateway', 1);
});

test('VPC subnet layout matches required masks on 2 AZs', () => {
  const app = new cdk.App();
  const stack = new CdkInit.CdkInitStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  const resources = template.toJSON().Resources as Record<string, any>;
  const subnetResources = Object.values(resources).filter(
    (resource) => resource.Type === 'AWS::EC2::Subnet',
  );

  expect(subnetResources).toHaveLength(8);

  const subnetBits = subnetResources.map(
    (subnet) => subnet.Properties?.CidrBlock?.split('/')[1],
  );

  expect(subnetBits.filter((bits) => bits === '24')).toHaveLength(2); // /24
  expect(subnetBits.filter((bits) => bits === '18')).toHaveLength(2); // /18
  expect(subnetBits.filter((bits) => bits === '20')).toHaveLength(4); // /20
});
