function changeTimezone(date, ianatz) {
  var invdate = new Date(
    date.toLocaleString("en-US", {
      timeZone: ianatz,
    })
  );
  var diff = date.getTime() - invdate.getTime();
  return new Date(date.getTime() + diff);
}

module.exports = changeTimezone;