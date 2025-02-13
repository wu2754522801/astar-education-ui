import request from '@/utils/request'

// 查询题库管理列表
export function listBank(query) {
  return request({
    url: '/education/bank/list',
    method: 'get',
    params: query
  })
}

// 查询题库管理详细
export function getBank(id) {
  return request({
    url: '/education/bank/' + id,
    method: 'get'
  })
}

// 新增题库管理
export function addBank(data) {
  return request({
    url: '/education/bank',
    method: 'post',
    data: data
  })
}

// 修改题库管理
export function updateBank(data) {
  return request({
    url: '/education/bank',
    method: 'put',
    data: data
  })
}

// 删除题库管理
export function delBank(id) {
  return request({
    url: '/education/bank/' + id,
    method: 'delete'
  })
}
