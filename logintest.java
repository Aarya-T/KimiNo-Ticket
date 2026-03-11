import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest {

    @Test
    public void validLoginTest() {

        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();

        driver.get("https://kimi-no-ticket-ruby.vercel.app/auth/sign-in");

        driver.findElement(By.cssSelector("input[placeholder='Enter your email']")).sendKeys("aaryatam49@gmail.com");
        driver.findElement(By.cssSelector("input[placeholder='Enter your password']")).sendKeys("aaryatambde");

        driver.findElement(By.xpath("//button[contains(text(),'Sign In')]")).click();

        // Example verification (you may change this depending on your app)
        String pageText = driver.getPageSource();
        Assert.assertTrue(pageText.contains("Dashboard") || pageText.contains("Welcome"));

        driver.quit();
    }
}
