import {SET_ALERT, REMOVE_ALERT } from '../actions/types'
const initialState =[]

/* 
 action will have actionType and data we have to evaluate axtionType
*/

export default function(state =initialState, action) {
    const {type, payload} = action;
    switch(type) {
        case SET_ALERT:
            return [...state, payload];
        case REMOVE_ALERT:
            return state.filter(alter => alter.id !== payload);
        default:
            return state
    }
}