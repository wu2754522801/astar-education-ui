import request from '@/utils/request'

// 查询问卷调查管理列表
export function listQuestionnaire(query) {
  return request({
    url: '/questionnaire/list',
    method: 'get',
    params: query
  })
}

// 查询问卷调查管理详细
export function getQuestionnaire(id) {
  return request({
    url: '/questionnaire/' + id,
    method: 'get'
  })
}

// 新增问卷调查管理
export function addQuestionnaire(data) {
  return request({
    url: '/questionnaire',
    method: 'post',
    data: data
  })
}

// 修改问卷调查管理
export function updateQuestionnaire(data) {
  return request({
    url: '/questionnaire',
    method: 'put',
    data: data
  })
}

// 删除问卷调查管理
export function delQuestionnaire(id) {
  return request({
    url: '/questionnaire/' + id,
    method: 'delete'
  })
}

// 发布问卷调查管理
export function publish(data) {
  return request({
    url: '/questionnaire/publish',
    method: 'put',
    data: data
  })
}

// 获取问卷配置
export function getQsByUrl(url) {
  return request({
    url: '/qs/getQs/' + url,
    method: 'get'
  })
}

// 填报问卷
export function fillQs(data) {
  return request({
    url: '/qs/fillQs',
    method: 'post',
    data: data
  })
}

export function qsFillManage(query) {
  return request({
    url: '/questionnaire/qsFillManage',
    method: 'get',
    params: query
  })
}
