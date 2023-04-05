const { name } = require('./package.json')
module.exports = {
    repositoryUrl: 'https://github.com/CaoMeiYouRen/cmyr-sign',
    plugins: [
        [
            "@semantic-release/commit-analyzer",
            {
                "config": "conventional-changelog-cmyr-config"
            }
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                "config": "conventional-changelog-cmyr-config"
            }
        ],
        [
            "@semantic-release/changelog",
            {
                "changelogFile": "CHANGELOG.md",
                "changelogTitle": "# " + name
            }
        ],
        '@semantic-release/npm',
        '@semantic-release/github',
        [
            "@semantic-release/git",
            {
                "assets": [
                    "src",
                    "CHANGELOG.md",
                    "package.json"
                ]
            }
        ]
    ]
}
