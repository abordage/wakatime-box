# WakaTime Statistics in your GitHub profile

Automatically update your pinned gist with weekly (monthly, yearly) WakaTime statistics.

<p style="text-align: center;" align="center">
<a href="https://github.com/abordage" title="WakaTime Statistics Gist">
    <img alt="WakaTime Statistics Gist" 
   src="https://github.com/abordage/wakatime-box/blob/master/docs/images/example-830-rounded.png">
</a>
</p>


<p style="text-align: center;" align="center">

<a href="https://github.com/abordage" title="language">
    <img alt="language" src="https://img.shields.io/badge/language-typescript-blue">
</a>

<a href="https://github.com/abordage/wakatime-box/blob/master/LICENSE.md" title="License">
    <img alt="License" src="https://img.shields.io/github/license/abordage/wakatime-box">
</a>

</p>


[▶ **See example**](https://github.com/abordage)

## How it works

1. [Create](https://wakatime.com/signup) WakaTime account (it's free)
2. **Enable** `Display code time publicly` and `Display languages, editors, os, categories publicly` in
   WakaTime [profile settings](https://wakatime.com/settings/profile)
3. **Copy** WakaTime [API Key](https://wakatime.com/settings/api-key)
4. [Create a token](https://github.com/settings/tokens/new) in your GitHub account settings with the `gist scope` only and **copy**
   it
5. **Fork** this repo
6. In your fork go to **Settings > Secrets > Actions secrets**
7. **Create** new **Environment secrets:**
    - `GH_TOKEN`: GitHub token generated earlier
    - `WAKA_API_KEY`: API key for your WakaTime account
8. **Replace** `GIST_ID` in the file`.github/workflows/schedule.yml`
9. Go to **Actions > Update Gist** and **Run workflow**

It's all. Gist should update and show your WakaTime stats. Pin this gist on your profile!
Next, statistics will be updated automatically every day.

## Feedback

If you have any feedback, comments or suggestions, please feel free to open an issue within this repository.

## Contributing

Please see [CONTRIBUTING](https://github.com/abordage/.github/blob/master/CONTRIBUTING.md) for details.

## Credits

- Pavel Bychko ([abordage](https://github.com/abordage))
- [All Contributors](https://github.com/abordage/wakatime-box/graphs/contributors)

## Inspired From

- [matchai/waka-box](https://github.com/matchai/waka-box)
- [maxam2017/productive-box](https://github.com/maxam2017/productive-box)
- and other [awesome pinned-gist project](https://github.com/matchai/awesome-pinned-gists)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
