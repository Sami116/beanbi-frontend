import { listMyChartByPageUsingPOST } from '@/services/beanbi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Card, List, message, Result } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initRequestParams: API.ChartQueryRequest = {
    current: 1,
    pageSize: 8,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  const [requestParams, setRequestParams] = useState<API.ChartQueryRequest>({
    ...initRequestParams,
  });
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [loading, setLoading] = useState<boolean>(true);
  const loaddata = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(requestParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        if (res.data.records) {
          res.data.records.forEach((data) => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          });
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败', +e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loaddata();
  }, [requestParams]);

  return (
    <div className="my-chart-page">
      <div className={'margin-16'}>
        <Search
          loading={loading}
          enterButton
          placeholder={'请输入图标名称'}
          onSearch={(value) => {
            setRequestParams({
              ...initRequestParams,
              name: value,
            });
          }}
        />
      </div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
        pagination={{
          onChange: (page) => {
            setRequestParams({
              ...requestParams,
              current: page,
            });
          },
          current: requestParams.current,
          pageSize: requestParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card>
              <Card style={{ marginBottom: 12 }}>
                <List.Item.Meta
                  avatar={<Avatar src={currentUser?.userAvatar} />}
                  title={item.name}
                  description={item.chartType ? '图表类型：' + item.chartType : undefined}
                />
                <div style={{ marginTop: 12 }}>{'分析目标：' + item.goal}</div>
              </Card>
              {item.status === 'wait' && (
                <Result
                  status={'warning'}
                  title={'任务等待执行中'}
                  subTitle={item.execMessage ?? '图表生成任务繁忙，请耐心等候'}
                />
              )}
              {item.status === 'running' && (
                <Result status={'info'} title={'图表生成中'} subTitle={item.execMessage} />
              )}
              {item.status === 'succeed' && (
                <Card>
                  <ReactECharts option={JSON.parse(item.genChart ?? '{}')} />
                </Card>
              )}
              {item.status === 'failed' && (
                <Result status={'error'} title={'图表生成失败'} subTitle={item.execMessage} />
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
