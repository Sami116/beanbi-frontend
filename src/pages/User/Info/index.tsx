import { request } from '@/app';
import { updateUserUsingPOST } from '@/services/beanbi/userController';
import { useModel } from '@@/exports';
import { LoadingOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Space,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import React, { useState } from 'react';

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt3M = file.size / 1024 / 1024 < 3;
  if (!isLt3M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt3M;
};

const Index: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [updateModalShow, setUpdateModalShow] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [imageUrl, setImageUrl] = useState<string | null>(currentUser?.userAvatar ?? null);

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
      location.reload();
    }
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };
  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    const res = await updateUserUsingPOST({
      ...values,
      id: currentUser?.id,
    });
    if (res.code === 0 && res.data === true) {
      message.success('修改成功');
    } else {
      message.error('修改失败，请刷新重试！');
    }
    setUpdateModalShow(false);
    location.reload();
  };
  return (
    <>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="个人信息"
          actions={[
            <b key="time">创建时间：{currentUser?.createTime ?? null}</b>,
            <b key="role">身份：{currentUser?.userRole === 'admin' ? '管理员' : '普通用户'}</b>,
          ]}
          extra={
            <Button type={'link'} onClick={() => setUpdateModalShow(true)}>
              编辑
            </Button>
          }
        >
          <Card.Meta
            avatar={
              <>
                <Upload
                  name="file"
                  // listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  maxCount={1}
                  withCredentials={true}
                  action={request.baseURL + 'api/user/update/avatar'}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                >
                  {imageUrl ? (
                    <Avatar
                      size={{ xs: 30, sm: 40, md: 48, lg: 70, xl: 88, xxl: 100 }}
                      src={imageUrl}
                      icon={<UserOutlined />}
                    />
                  ) : (
                    <div>
                      {loading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>上传头像</div>
                    </div>
                  )}
                </Upload>
              </>
            }
            title={currentUser?.userName ?? null}
            description={'账号：' + currentUser?.userAccount ?? null}
          />
        </Card>
      </Space>

      <Modal
        title="编辑信息"
        open={updateModalShow}
        confirmLoading={loading}
        footer={null}
        onCancel={() => setUpdateModalShow(false)}
      >
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            {...formItemLayout}
            name="userName"
            label="昵称"
            initialValue={currentUser?.userName ?? null}
            rules={[{ required: true, message: '请输入你的昵称' }]}
          >
            <Input placeholder="请输入你的昵称" />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                修改
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Index;
