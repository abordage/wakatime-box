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

1. [**Create**](https://wakatime.com/signup) WakaTime account (it's free)
2. **Enable** `Display code time publicly` and `Display languages, editors...` in
   WakaTime [profile settings](https://wakatime.com/settings/profile)
3. **Copy** WakaTime [API Key](https://wakatime.com/settings/api-key)
4. [**Create**](https://github.com/settings/tokens/new) a token in your GitHub account settings with the `gist scope` only
   and **copy** it
5. [**Create**](https://gist.github.com) a new public Gist and copy GIST_ID from url
6. **Fork** this repo
7. Go to **Settings > Secrets > Actions secrets** in **your fork**
8. **Create** new **Environment secrets:**
    - `GH_TOKEN`: GitHub token generated earlier
    - `WAKA_API_KEY`: API key for your WakaTime account
    - `GIST_ID`: API key for your WakaTime account

It's all. Go to **Actions > Update Gist** and **Run workflow**. Gist should update and show your WakaTime stats. 
Next, statistics will be updated automatically every day. Pin this gist on your profile!

> Inspired from [matchai/waka-box](https://github.com/matchai/waka-box) and other [awesome pinned-gist project](https://github.com/matchai/awesome-pinned-gists)

## Compared to package `matchai/waka-box`:
1. customizable **time range**
2. customizable **number of languages**
3. correct time counting of **other languages**
4. **summary report** on action

## Feedback

If you have any feedback, comments or suggestions, please feel free to open an issue within this repository.

## Contributing

Please see [CONTRIBUTING](https://github.com/abordage/.github/blob/master/CONTRIBUTING.md) for details.

## Credits

- Pavel Bychko ([abordage](https://github.com/abordage))
- [All Contributors](https://github.com/abordage/wakatime-box/graphs/contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
