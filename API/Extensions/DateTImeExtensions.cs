namespace API.Extensions
{
    public static class DateTimeExtensions
    {
        public static int CalculateAge (this DateOnly dateTime)
        {
            // Get today's date
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Calculate the age
            var age = today.Year - dateTime.Year;

            // Adjust age if the birthday hasn't occurred yet this year
            if (dateTime > today.AddYears(-age)) 
            {
                age--;
            }

            return age;
        }
    }
}