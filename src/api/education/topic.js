import request from '@/utils/request'

// 查询试卷题目管理列表
export function listTopic(query) {
  return request({
    url: '/education/topic/list',
    method: 'get',
    params: query
  })
}

// 查询试卷题目管理详细
export function getTopic(id) {
  return request({
    url: '/education/topic/' + id,
    method: 'get'
  })
}

// 新增试卷题目管理
export function addTopic(data) {
  return request({
    url: '/education/topic',
    method: 'post',
    data: data
  })
}

// 修改试卷题目管理
export function updateTopic(data) {
  return request({
    url: '/education/topic',
    method: 'put',
    data: data
  })
}

// 删除试卷题目管理
export function delTopic(id) {
  return request({
    url: '/education/topic/' + id,
    method: 'delete'
  })
}
