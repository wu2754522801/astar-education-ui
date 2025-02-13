import request from '@/utils/request'

// 查询年级管理列表
export function listClass(query) {
  return request({
    url: '/education/class/list',
    method: 'get',
    params: query
  })
}

export function selectList(query) {
  return request({
    url: '/education/class/selectList',
    method: 'get',
    params: query
  })
}

// 查询年级管理详细
export function getClass(id) {
  return request({
    url: '/education/class/' + id,
    method: 'get'
  })
}

// 新增年级管理
export function addClass(data) {
  return request({
    url: '/education/class',
    method: 'post',
    data: data
  })
}

// 修改年级管理
export function updateClass(data) {
  return request({
    url: '/education/class',
    method: 'put',
    data: data
  })
}

// 删除年级管理
export function delClass(id) {
  return request({
    url: '/education/class/' + id,
    method: 'delete'
  })
}
