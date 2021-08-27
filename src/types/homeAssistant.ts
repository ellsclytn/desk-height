export type HomeAssistantMessage = AuthRequiredMessage | AuthOkMessage | AuthInvalidMessage | ResultMessage | EventMessage

interface AuthRequiredMessage {
  type: 'auth_required'
  ha_version: string
}

interface AuthOkMessage {
  type: 'auth_ok'
  ha_version: string
}

interface AuthInvalidMessage {
  type: 'auth_invalid'
  message: string
}

type EntityList = Array<{
  entity_id: string
  state: string
}>

interface SuccessResultMessage {
  type: 'result'
  success: true
  result: EntityList | null
}

interface FailedResultMessage {
  type: 'result'
  success: false
}

type ResultMessage = SuccessResultMessage | FailedResultMessage

interface EventMessage {
  id: number
  type: 'event'
  event: {
    event_type: 'state_changed'
    data: {
      entity_id: string
      old_state: State
      new_state: State
    }
    time_fired: string
  }
}

interface State {
  entity_id: string
  state: string
  attributes: {
    unit_of_measurement: string
    friendly_name: string
    icon: string
  }
  last_changed: string
  last_updated: string
}

// const thing = {
//   id: 2,
//   type: 'event',
//   event: {
//     event_type: 'state_changed',
//     data: {
//       entity_id: 'sensor.ellis_s_computer_switch_energy_current',
//       old_state: [Object],
//       new_state: [Object]
//     },
//     origin: 'LOCAL',
//     time_fired: '2021-08-27T00:57:08.488935+00:00',
//     context: {
//       id: '381b29a8e04e36c33114b19da1f712a5',
//       parent_id: null,
//       user_id: null
//     }
//   }
// }
