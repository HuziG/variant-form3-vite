import {
  buildActiveTabs,
  buildDefaultValueListFn,
  buildFieldOptionsFn,
  buildRulesListFn,
  buildUploadDataFn
} from '@/utils/vue2js-generator'
import { traverseContainerWidgets, traverseFieldWidgets } from '@/utils/util'

export const genVue3JS = function (formConfig, widgetList) {
  let defaultValueList = []
  let rulesList = []
  let fieldOptions = []
  let uploadData = []
  traverseFieldWidgets(widgetList, (widget) => {
    buildDefaultValueListFn(formConfig, widgetList, defaultValueList)(widget)
    buildRulesListFn(formConfig, widgetList, rulesList)(widget)
    buildFieldOptionsFn(formConfig, widgetList, fieldOptions)(widget)
    buildUploadDataFn(formConfig, widgetList, uploadData)(widget)
  })

  const activeTabs = buildActiveTabs(formConfig, widgetList)

  const v3JSTemplate =
`  import { defineComponent, toRefs, reactive, getCurrentInstance } from 'vue'
  
  export default defineComponent({
    components: {},
    props: {},
    setup() {
      const state = reactive({
        ${formConfig.modelName}: {
          ${defaultValueList.join('\n')}
        },
        
        ${formConfig.rulesName}: {
          ${rulesList.join('\n')}
        },
        
        ${activeTabs.join('\n')}
        
        ${fieldOptions.join('\n')}
        
        ${uploadData.join('\n')}
      })
    
      const instance = getCurrentInstance()
      
      const submitForm = () => {
        instance.proxy.$refs['vForm'].validate(valid => {
          if (!valid) return
          
          //TODO: 提交表单
        })
      }
      
      const resetForm = () => {
        instance.proxy.$refs['vForm'].resetFields()
      }
      
      return {
        ...toRefs(state),
        submitForm,
        resetForm
      }
    }
  })`

  return v3JSTemplate
}


export function buildFieldOptionsFn_setup(formConfig, widgetList, resultList) {
  return function(fieldWidget) {
    const fop = fieldWidget.options
    const ft = fieldWidget.type
    if ((ft === 'radio') || (ft === 'checkbox') || (ft === 'select') || (ft === 'cascader')) {
      resultList.push(`const ${fop.name}Options = ref(${JSON.stringify(fop.optionItems)})`)
    }
  }
}

export function buildUploadDataFn_setup(formConfig, widgetList, resultList) {
  return function(fieldWidget) {
    const fop = fieldWidget.options
    const ft = fieldWidget.type
    if ((ft === 'picture-upload') || (ft === 'file-upload')) {
      resultList.push(`const ${fop.name}FileList = ref([])`)
      resultList.push(`const ${fop.name}UploadHeaders = ref({})`)
      resultList.push(`const ${fop.name}UploadData = ref({})`)
    }
  }
}

export function buildActiveTabs_setup(formConfig, widgetList) {
  let resultList = []
  const handlerFn = function (cw) {
    const cop = cw.options
    const ct = cw.type
    if (ct === 'tab') {
      cw.tabs.length > 0 && resultList.push(`const ${cop.name}ActiveTab = ref('${cw.tabs[0].options.name}')`)
    }
  }
  traverseContainerWidgets(widgetList, handlerFn)

  return resultList
}

export const genVue3SetupJS = function (formConfig, widgetList) {
  let defaultValueList = []
  let rulesList = []
  let fieldOptions = []
  let uploadData = []
  traverseFieldWidgets(widgetList, (widget) => {
    buildDefaultValueListFn(formConfig, widgetList, defaultValueList)(widget)
    buildRulesListFn(formConfig, widgetList, rulesList)(widget)
    buildFieldOptionsFn_setup(formConfig, widgetList, fieldOptions)(widget)
    buildUploadDataFn_setup(formConfig, widgetList, uploadData)(widget)
  })

  const activeTabs = buildActiveTabs_setup(formConfig, widgetList)

  const v3JSTemplate =
    `  import { ref, reactive } from 'vue'
       
      const vForm = ref(null)
    
      const ${formConfig.modelName} = reactive({${defaultValueList.join('\n')}})
      
      const ${formConfig.rulesName} = reactive({${rulesList.join('\n')}})
      
      ${activeTabs.join('\n')}
      
      ${fieldOptions.join('\n')}
      
      ${uploadData.join('\n')}
  
      const submitForm = () => {
        vForm.validate(valid => {
          if (!valid) return
          
          //TODO: 提交表单
        })
      }
      
      const resetForm = () => {
        vForm.resetFields()
      }`

  return v3JSTemplate
}
