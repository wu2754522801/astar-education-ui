import request from '@/utils/request'

// 首页统计
export function getIndexStatistics() {
  return request({
    url: '/index/statistics/data',
    method: 'get',
  })
}
