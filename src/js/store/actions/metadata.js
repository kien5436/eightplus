export default function(data) {

  const setMetadata = (type, metaData) => ({ type, metaData });

  return async (dispatch) => { dispatch(setMetadata(data.type, data.metaData)); }
}