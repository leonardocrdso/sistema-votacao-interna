import { createContext, useContext, useReducer } from 'react'

// Estado inicial
const initialState = {
  filial: null,
  cadastro: '',
  cpf: '',
  candidatos: [],
  votoRealizado: false,
  candidatoEscolhido: null,
  loading: false,
  error: null
}

// Tipos de ações
const actionTypes = {
  SET_IDENTIFICACAO: 'SET_IDENTIFICACAO',
  SET_CANDIDATOS: 'SET_CANDIDATOS',
  SET_VOTO_REALIZADO: 'SET_VOTO_REALIZADO',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE'
}

// Reducer
function votingReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_IDENTIFICACAO:
      return {
        ...state,
        filial: action.payload.filial,
        cadastro: action.payload.cadastro,
        cpf: action.payload.cpf,
        error: null
      }

    case actionTypes.SET_CANDIDATOS:
      return {
        ...state,
        candidatos: action.payload,
        loading: false,
        error: null
      }

    case actionTypes.SET_VOTO_REALIZADO:
      return {
        ...state,
        votoRealizado: true,
        candidatoEscolhido: action.payload,
        loading: false,
        error: null
      }

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      }

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case actionTypes.RESET_STATE:
      return initialState

    default:
      return state
  }
}

// Context
const VotingContext = createContext()

// Provider
export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, initialState)

  // Actions
  const setIdentificacao = (identificacao) => {
    dispatch({
      type: actionTypes.SET_IDENTIFICACAO,
      payload: identificacao
    })
  }

  const setCandidatos = (candidatos) => {
    dispatch({
      type: actionTypes.SET_CANDIDATOS,
      payload: candidatos
    })
  }

  const setVotoRealizado = (candidato) => {
    dispatch({
      type: actionTypes.SET_VOTO_REALIZADO,
      payload: candidato
    })
  }

  const setLoading = (loading) => {
    dispatch({
      type: actionTypes.SET_LOADING,
      payload: loading
    })
  }

  const setError = (error) => {
    dispatch({
      type: actionTypes.SET_ERROR,
      payload: error
    })
  }

  const resetState = () => {
    dispatch({
      type: actionTypes.RESET_STATE
    })
  }

  const value = {
    ...state,
    setIdentificacao,
    setCandidatos,
    setVotoRealizado,
    setLoading,
    setError,
    resetState
  }

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  )
}

// Hook personalizado
export function useVoting() {
  const context = useContext(VotingContext)
  if (!context) {
    throw new Error('useVoting deve ser usado dentro de um VotingProvider')
  }
  return context
}

export default VotingContext