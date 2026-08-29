#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkInitStack } from '../lib/cdk-init-stack';
import { Ec2InstanceStack } from '../lib/ec2-instance-stack';

const app = new cdk.App();
const networkStack = new CdkInitStack(app, 'CdkInitStack', {
  /* 'env' を指定しない場合、このスタックは環境非依存になります。
   * AWSアカウント/リージョンに依存する機能やコンテキスト参照は使用できませんが、
   * 合成したテンプレートをどの環境にもデプロイできます。 */

  /* 現在のCLI設定から取得したAWSアカウントとリージョンにスタックを特定する場合は、
   * 次の行のコメントを解除してください。 */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* デプロイ先のAWSアカウントとリージョンが明確な場合は、
   * 次の行のコメントを解除して値を設定してください。 */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* 詳細については https://docs.aws.amazon.com/cdk/latest/guide/environments.html を参照してください。 */
});

// VPCスタックとは別スタックとしてEC2インスタンスを作成する
new Ec2InstanceStack(app, 'Ec2InstanceStack', {
  vpc: networkStack.vpc,
});
