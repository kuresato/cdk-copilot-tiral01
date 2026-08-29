import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface Ec2InstanceStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class Ec2InstanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2InstanceStackProps) {
    super(scope, id, props);

    // EC2インスタンスをプライベートサブネットに作成し、SSM接続を有効化する
    const instance = new ec2.Instance(this, 'AppInstance', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      instanceType: new ec2.InstanceType('t4.nano'),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      ssmSessionPermissions: true,
    });

    // 作成したインスタンスIDをスタック出力に公開する
    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
    });
  }
}
