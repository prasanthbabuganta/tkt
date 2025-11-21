import authReducer, { login, logout, clearError } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error',
    };
    expect(authReducer(stateWithError, clearError())).toEqual({
      ...initialState,
      error: null,
    });
  });

  // Note: Testing thunks requires more setup with redux-mock-store or similar
  // For now we test the reducer logic
});
