import request from '@/utils/request'

// 查询题库选项管理列表
export function listOptions(query) {
  return request({
    url: '/education/options/list',
    method: 'get',
    params: query
  })
}

// 查询题库选项管理详细
export function getOptions(id) {
  return request({
    url: '/education/options/' + id,
    method: 'get'
  })
}

// 新增题库选项管理
export function addOptions(data) {
  return request({
    url: '/education/options',
    method: 'post',
    data: data
  })
}

// 修改题库选项管理
export function updateOptions(data) {
  return request({
    url: '/education/options',
    method: 'put',
    data: data
  })
}

// 删除题库选项管理
export function delOptions(id) {
  return request({
    url: '/education/options/' + id,
    method: 'delete'
  })
}
