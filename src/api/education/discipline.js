import request from '@/utils/request'

// 查询学科管理列表
export function listDiscipline(query) {
  return request({
    url: '/education/discipline/list',
    method: 'get',
    params: query
  })
}

export function selectList(query) {
  return request({
    url: '/education/discipline/selectList',
    method: 'get',
    params: query
  })
}

// 查询学科管理详细
export function getDiscipline(id) {
  return request({
    url: '/education/discipline/' + id,
    method: 'get'
  })
}

// 新增学科管理
export function addDiscipline(data) {
  return request({
    url: '/education/discipline',
    method: 'post',
    data: data
  })
}

// 修改学科管理
export function updateDiscipline(data) {
  return request({
    url: '/education/discipline',
    method: 'put',
    data: data
  })
}

// 删除学科管理
export function delDiscipline(id) {
  return request({
    url: '/education/discipline/' + id,
    method: 'delete'
  })
}
