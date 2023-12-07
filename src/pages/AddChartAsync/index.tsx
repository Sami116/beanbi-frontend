import {genChartByAiAsyncMQUsingPOST, genChartByAiAsyncUsingPOST} from '@/services/beanbi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Select, Space, Upload } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';

/**
 * 异步添加图表页面
 * @constructor
 */
const AddChartAsync: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useForm();
  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (loading) {
      return;
    }
    setLoading(true);
    const params = {
      ...values,
      file: undefined,
    };
    try {
      // const res = await genChartByAiAsyncUsingPOST(params, {}, values.file.file.originFileObj);
      const res = await genChartByAiAsyncMQUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res.data) {
        message.error(res.message);
      } else {
        message.success('分析任务提交成功，请在我的图表页面查看任务状态');
        form.resetFields();
      }
    } catch (e: any) {
      message.error('分析失败,' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-chart">
      <Card title={'智能分析（异步）'}>
        <Form
          form={form}
          name="addChart"
          labelAlign="left"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          initialValues={{}}
        >
          <Form.Item
            name="goal"
            label="分析目标"
            rules={[{ required: true, message: '请选输入分析目标' }]}
          >
            <TextArea placeholder="请输入你的分析需求，比如分析网站用户的增长情况" />
          </Form.Item>
          <Form.Item name="name" label="图表名称">
            <Input placeholder="请输入你的图表名称" />
          </Form.Item>

          <Form.Item name="chartType" label="图表类型">
            <Select
              placeholder="请选择图表类型"
              options={[
                { value: '折线图', label: '折线图' },
                { value: '柱状图', label: '柱状图' },
                { value: '堆叠图', label: '堆叠图' },
                { value: '饼图', label: '饼图' },
                { value: '雷达图', label: '雷达图' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="file"
            label="原始数据"
            rules={[{ required: true, message: '请上传分析数据' }]}
          >
            <Upload name="file" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传csv文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 24, offset: 4 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                分析
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default AddChartAsync;
