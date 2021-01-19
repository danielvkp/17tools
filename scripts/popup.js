document.addEventListener('DOMContentLoaded', function() {

    const btn_inicio       = document.getElementById('mega_botom');
    const btn_stop         = document.getElementById('mega_botom_stop');
    const balance_options  = document.getElementsByName('sref');
    const delta_arbitraje  = document.getElementById('delta_arbitraje')
    const profit_cliente   = document.getElementById('profit_cliente')
    const delta_cliente    = document.getElementById('delta_cliente')
    const interval_time    = document.getElementById('interval_time')
    const reference_opcion = document.getElementById('reference_opcion')
    const balance_option   = document.getElementById('balance_option')
    const max_name         = document.getElementById('max_name')
    const min_name         = document.getElementById('min_name')

    const stateIntervalInput = boolean_value => {
      interval_time.disabled = boolean_value
      chrome.storage.local.set({ disabled_interval: boolean_value })
    }

    const stateStartButton = boolean_value => {
      btn_inicio.disabled  = boolean_value
      chrome.storage.local.set({ disabled_inicio: boolean_value })
    }

    const stateStopButton = boolean_value => {
      btn_stop.disabled   = boolean_value
      chrome.storage.local.set({ disabled_stop: boolean_value })
    }

    chrome.tabs.getSelected(null, tab => chrome.tabs.sendMessage(tab.id, {type:"run_once"}))

    btn_inicio.addEventListener('click', function() {
      stateStartButton(true)
      stateStopButton(false)
      stateIntervalInput(true)
      chrome.tabs.getSelected(null, function(tab){
          chrome.tabs.sendMessage(tab.id, {type:"start", interval_time: interval_time.value});
          chrome.storage.local.set({interval_time_storage: interval_time.value})
      })
    })

    btn_stop.addEventListener('click', function() {
      stateStartButton(false)
      stateStopButton(true)
      stateIntervalInput(false)
      chrome.tabs.getSelected(null, function(tab){
          chrome.tabs.sendMessage(tab.id, {type:"stop"});
      })
    })

    balance_options.forEach(element => {
          element.addEventListener("click", () => {
            chrome.tabs.getSelected(null, tab => {
              let type = (element.value == 'B') ? 'referencia_b' : 'referencia_r'
              chrome.storage.local.set({referencia_type : type })
              chrome.tabs.sendMessage(tab.id, { type: type })
          })
       })
    })

    /*Obtener valores para habilitar o deshabilitar botones*/
    chrome.storage.local.get(['disabled_interval'], result => {
      if(result.disabled_interval) {
          interval_time.disabled = result.disabled_interval
       }
    })

    chrome.storage.local.get(['disabled_inicio'], function(result) {
      if(result.disabled_inicio){
          btn_inicio.disabled = result.disabled_inicio
       }
    })

    chrome.storage.local.get(['disabled_stop'], function(result) {
      if(result.disabled_stop){
          btn_stop.disabled = result.disabled_stop
       }
    })

    /* Estado para mantener la referencia */
    chrome.storage.local.get(['referencia_type'], function(result) {
      if(result.referencia_type){
        (result.referencia_type == 'referencia_b') ? balance_option.checked = true : reference_opcion.checked = true
       }
    })

    /* Estado para el valor del intervalo */
    chrome.storage.local.get(['interval_time_storage'], function(result) {
      if(result.interval_time_storage){
         interval_time.value = result.interval_time_storage
       }
    })

    chrome.storage.local.get(['delta_arbitraje'], function(result) {
      if(result.delta_arbitraje){
          delta_arbitraje.innerHTML = result.delta_arbitraje
       }
    })

    chrome.storage.local.get(['profit_cliente'], function(result) {
        if(result.profit_cliente){
          profit_cliente.innerHTML = result.profit_cliente
        }
    })

    chrome.storage.local.get(['delta_cliente'], function(result) {
        if(result.delta_cliente){
          delta_cliente.innerHTML = result.delta_cliente
        }
    })

    chrome.storage.local.get(['max_name'], result => max_name.innerHTML = (result.max_name) ? result.max_name : 'N/A' )

    chrome.storage.local.get(['min_name'], result => min_name.innerHTML = (result.min_name) ? result.min_name : 'N/A' )

    chrome.runtime.onMessage.addListener((message, sender, sendresponse)=> {
      switch (message.type) {
        case 'delta_arbitraje':
            delta_arbitraje.innerHTML = message.delta_arbitraje
            break;
        case 'profit_cliente' :
            profit_cliente.innerHTML = message.profit_cliente
            delta_cliente.innerHTML = `${message.delta_cliente}%`
            break;
        case 'max_name' :
            max_name.innerHTML = message.max_name
            break;
        case 'max_name' :
            max_name.innerHTML = message.max_name
            break;
        case 'min_name' :
            min_name.innerHTML = message.min_name
            break;
        default:
      }
    })

})
