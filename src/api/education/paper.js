import request from '@/utils/request'

// 查询试卷管理列表
export function listPaper(query) {
  return request({
    url: '/education/paper/list',
    method: 'get',
    params: query
  })
}

// 查询试卷管理详细
export function getPaper(id) {
  return request({
    url: '/education/paper/' + id,
    method: 'get'
  })
}

// 新增试卷管理
export function addPaper(data) {
  return request({
    url: '/education/paper',
    method: 'post',
    data: data
  })
}

// 修改试卷管理
export function updatePaper(data) {
  return request({
    url: '/education/paper',
    method: 'put',
    data: data
  })
}

// 删除试卷管理
export function delPaper(id) {
  return request({
    url: '/education/paper/' + id,
    method: 'delete'
  })
}

export function updateStatus(id, status) {
  let query={
    id:id,
    examinationPaperStatus: status
  }
  return request({
    url: '/education/paper/updateStatus',
    method: 'put',
    params: query
  })
}
