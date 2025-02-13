import request from '@/utils/request'

// 查询试卷任务管理列表
export function listTask(query) {
  return request({
    url: '/education/task/list',
    method: 'get',
    params: query
  })
}

// 查询试卷任务管理详细
export function getTask(id) {
  return request({
    url: '/education/task/' + id,
    method: 'get'
  })
}

// 新增试卷任务管理
export function addTask(data) {
  return request({
    url: '/education/task',
    method: 'post',
    data: data
  })
}

// 修改试卷任务管理
export function updateTask(data) {
  return request({
    url: '/education/task',
    method: 'put',
    data: data
  })
}

// 删除试卷任务管理
export function delTask(id) {
  return request({
    url: '/education/task/' + id,
    method: 'delete'
  })
}
