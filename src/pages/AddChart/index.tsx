import { genChartByAiUsingPOST } from '@/services/beanbi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Select, Space, Spin, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

/**
 * 添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
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
    setChart(undefined);
    setOption(undefined);
    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res.data) {
        message.error(res.message);
      } else {
        message.success('分析成功');
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误');
        } else {
          setChart(res.data);
          setOption(chartOption);
        }
      }
    } catch (e: any) {
      message.error('分析失败,' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title={'智能分析'}>
            <Form
              name="addChart"
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 24 }}
              onFinish={onFinish}
              initialValues={{}}
              style={{ maxWidth: 600 }}
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
        </Col>
        <Col span={12}>
          <Card title={'分析结果'}>
            {chart?.genResult}
            <Spin spinning={loading} />
          </Card>
          <Card title={'生成图表'}>
            {option && <ReactECharts option={option} />}
            <Spin spinning={loading} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default AddChart;
