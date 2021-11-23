function getInterval( date ){
  let interval = date[16]+date[17]+date[18]+date[19]+date[20];
  return interval;
}

// 12:10

module.exports = getInterval;