import request from '@/utils/request'

// 查询填写问卷管理列表
export function listUser(query) {
  return request({
    url: '/questionnaire/user/list',
    method: 'get',
    params: query
  })
}

// 查询填写问卷管理详细
export function getUser(id) {
  return request({
    url: '/questionnaire/user/' + id,
    method: 'get'
  })
}

// 新增填写问卷管理
export function addUser(data) {
  return request({
    url: '/questionnaire/user',
    method: 'post',
    data: data
  })
}

// 修改填写问卷管理
export function updateUser(data) {
  return request({
    url: '/questionnaire/user',
    method: 'put',
    data: data
  })
}

// 删除填写问卷管理
export function delUser(id) {
  return request({
    url: '/questionnaire/user/' + id,
    method: 'delete'
  })
}
