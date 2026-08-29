import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as CdkInit from '../lib/cdk-init-stack';
import { Ec2InstanceStack } from '../lib/ec2-instance-stack';

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

test('EC2 instance stack is separated and configured for SSM on private subnet', () => {
  const app = new cdk.App();
  const networkStack = new CdkInit.CdkInitStack(app, 'NetworkStack');
  const ec2Stack = new Ec2InstanceStack(app, 'ComputeStack', {
    vpc: networkStack.vpc,
  });

  const networkTemplate = Template.fromStack(networkStack);
  const ec2Template = Template.fromStack(ec2Stack);

  networkTemplate.resourceCountIs('AWS::EC2::Instance', 0);
  ec2Template.resourceCountIs('AWS::EC2::Instance', 1);
  ec2Template.hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't4.nano',
    SubnetId: {
      'Fn::ImportValue': Match.stringLikeRegexp('PrivateWithEgress'),
    },
  });
  ec2Template.hasResourceProperties('AWS::IAM::Role', {
    ManagedPolicyArns: Match.arrayWith([
      {
        'Fn::Join': Match.arrayWith([
          '',
          Match.arrayWith([
            'arn:',
            { Ref: 'AWS::Partition' },
            ':iam::aws:policy/AmazonSSMManagedInstanceCore',
          ]),
        ]),
      },
    ]),
  });
  ec2Template.hasOutput('InstanceId', {});
});
