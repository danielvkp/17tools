var refreshIntervalId;

const input_balance = document.getElementById("value_entered")

const setup = () => input_balance.value = 1

const sendMessageToTab = message_object => chrome.runtime.sendMessage(message_object)

const createProfitAndDeltaObject = () => {

  const profit_cliente = document.querySelectorAll(".trade-calc-center-info p b")[0].innerText

  const delta_cliente  = document.querySelectorAll(".trade-calc-center-info p i")[3].innerText.match(/\d+\.\d+/)[0]

  const profit_clie_r = profit_cliente.match(/\d+\.\d+/)

  const porcentaje     = ((parseFloat(profit_clie_r[0]) / input_balance.value) * 100).toFixed(2)

  return {
    type:'profit_cliente',
    profit_cliente : profit_cliente,
    delta_cliente  : porcentaje
  }
}

const clickTrigger = found_element => found_element.getElementsByTagName('span')[0].click()

const getBalance = () => document.querySelector(".trade-amount-balance b").outerText

const clickApplyButton = () => {
  document.getElementById("value_entered_btn").click()
  setTimeout(() => { getProfitAndDeltaCliente()} , 1000)
}

const callFunctions = () => {
  ;(input_balance.value == "") ? setup() : null
  getMaxValue()
  getMinValue()
  clickApplyButton()
}

const startCount = time_for_interval => {
  callFunctions()
  let tfi = time_for_interval * 1000
  clearInterval(refreshIntervalId)
  refreshIntervalId = setInterval(()=>{callFunctions()}, tfi)
}

const gotMessage = (message, sender, sendresponse) => {
  switch (message.type) {
    case 'start':
        startCount(message.interval_time)
        break;
    case 'stop':
        clearInterval(refreshIntervalId)
        break;
    case 'referencia_b':
        input_balance.value = (hasBalance(getBalance())) ? getBalance() : 1
        break;
    case 'run_once':
        setup()
        callFunctions()
        break;
    case 'referencia_r':
        input_balance.value = 1
        break;
    default:
  }
}

function getMaxValue(){
	let table_max_values = document.querySelectorAll(".trade-form-crypts-table .table tbody .td-bid")

	const max_object = [...table_max_values].reduce((prev, current) => (parseFloat(prev.outerText) > parseFloat(current.outerText)) ? prev : current)

  const max_name = `${max_object.nextElementSibling.innerText} (${max_object.outerText} $)`

  sendMessageToTab({type:'max_name', max_name: max_name})

  chrome.storage.local.set({max_name: max_name})

  clickTrigger(max_object)
}

function getMinValue(){
	let table_min_values = document.querySelectorAll(".trade-form-crypts-table .table tbody .td-ask")

  const min_object = [...table_min_values].reduce((prev, current) => (parseFloat(prev.outerText) < parseFloat(current.outerText)) ? prev : current)

  const min_name = `${min_object.previousElementSibling.innerText} (${min_object.outerText} $)`

  sendMessageToTab({type:'min_name', min_name: min_name})

  chrome.storage.local.set({min_name: min_name})

  clickTrigger(min_object)

	setTimeout(() => { getDeltaArbitraje() }, 2000)
}

function getDeltaArbitraje(){
	let delta_arbitraje = document.querySelectorAll(".trade-form-midchart span b")[0].outerText

	sendMessageToTab({
		type:'delta_arbitraje',
		delta_arbitraje: delta_arbitraje
	})

  chrome.storage.local.set({delta_arbitraje: delta_arbitraje})
}

function getProfitAndDeltaCliente(){

  objet_created = createProfitAndDeltaObject()

  sendMessageToTab(objet_created)

  chrome.storage.local.set({
    profit_cliente : objet_created.profit_cliente,
    delta_cliente  : objet_created.porcentaje
  })
}

function hasBalance(balance){
  return (parseFloat(balance) > 0.02000000) ? true : false
}

function iniciar_cuenta(){
	const refreshIntervalId = setInterval(()=>{
		console.log('hola');
	}, 3000);
}

chrome.runtime.onMessage.addListener(gotMessage);
