// Returns an array of dates between the two dates
var getDates = function(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    //console.log(currentDate, endDate)
    currentDate = addDays.call(currentDate, 1);
  }

  return dates
};

module.exports = { getDates: getDates};