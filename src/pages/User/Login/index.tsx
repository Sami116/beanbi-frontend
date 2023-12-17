import Footer from '@/components/Footer';
import {
  getLoginUserUsingGET,
  sendCodeUsingGET,
  userLoginByEmailUsingPOST,
  userLoginUsingPOST
} from '@/services/beanbi/userController';
import { Link } from '@@/exports';
import {LockOutlined, MailOutlined, UserOutlined} from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Tabs } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import {ProFormCaptcha} from "@ant-design/pro-form";

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  /**
   * 登陆成功后，获取用户登录信息
   */
  const fetchUserInfo = async () => {
    const userInfo = await getLoginUserUsingGET();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };
  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      let res;
      // 登录
      if (type === 'account') {
        res = await userLoginUsingPOST({
          ...values,
        });
      } else {
        res = await userLoginByEmailUsingPOST({
          ...values,
        });
      }

      if (res.message === 'ok') {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      } else {
        message.error(res.message);
      }
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Bean智能 BI"
          // subTitle={'Bean智能 BI 是西湖区最具影响力的 Web 设计规范'}
          // actions={['其他登录方式 :', <ActionIcons key="icons" />]}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'email',
                label: 'QQ邮箱登录',
              },
            ]}
          />

          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {type === 'email' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                }}
                name="emailNum"
                placeholder={'请输入QQ邮箱！'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    // pattern: /^1\d{10}$/,    手机号码正则表达式
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                    message: '不合法的邮箱！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  autoComplete: "new-password",
                  size: 'large',
                  prefix: <LockOutlined/>,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'秒后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="emailCaptcha"
                phoneName="emailNum"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async (emailNum) => {
                  const captchaType: string = 'login';
                  const result = await sendCodeUsingGET({
                    emailNum,
                    captchaType,
                  });
                  if (result.data === false) {
                    return;
                  }
                  message.success(result.data);
                }}
              />
            </>
          )}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <Link to="/user/register">注册</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
