# Gno for Visual Studio Code

Welcome! 👋🏻<br/>
[The VS Code Gno extension]()
provides language support for the [Gnolang](https://github.com/gnolang/gno) and enhance your [Gnolang](https://github.com/gnolang/gno) development experience.

## Prerequisite

- Install [Go](https://golang.org) 1.21 or newer if you haven't already.

- Install [Gno](https://github.com/gnolang/gno/tree/master/gnovm/cmd/gno#install) and [Gnokey](https://github.com/gnolang/gno/tree/master/gno.land/cmd/gnokey#install-gnokey).

- Install `Gnopls` (See: https://github.com/harry-hov/gnopls)
  
- Install [gofumpt](https://github.com/mvdan/gofumpt)

    ```
    go install mvdan.cc/gofumpt@latest
    ```

- Add Go bin to PATH

   e.g (For MacOS)

   - Open zsh shell configuration file
   ```
   nano ~/.zshrc
   ```
   - Add line given below
   ```
   export PATH="${PATH}:${GOPATH}/bin"
   ```

- Update GNOROOT(path to gno repository clone) in the extension settings.

## Feature highlights

* [Syntax highlighting] - Syntax highlighting for Gno files
* [Formatting] - Automatically apply [gofumpt](https://github.com/mvdan/gofumpt) formatting on save
* [Transpile] - Transpile uses [gno](https://github.com/gnolhttps://github.com/gnolang/gno/tree/master/gnovm/cmd/gno). `gno` needs to be installed for this feature to work.
* [Test] - Test *_test.gno and *_filetest.gno files. Uses [gno](https://github.com/gnolhttps://github.com/gnolang/gno/tree/master/gnovm/cmd/gno) and `gno` needs to be installed for this feature to work.
* [Snippets] - Templates that make it easier to enter repeating code patterns, such as loops or conditional-statements.
* [Code Lens] - Enables CodeLens for *_test.gno and *_filetest.gno files.
* [Diagnostics] -  Build and lint errors shown as you type or on save. Needs language server(`gnopls`) to be enabled.
* [Mod Init] -  Create `gno.mod` file.
* [Publish Package] - Publish Gno package/realm to the chain. [`gnokey`](https://github.com/gnolang/gno/tree/master/gno.land/cmd/gnokey) needs to be installed for this feature to work.
* [Clean Generated Files] - Cleans generated Go(`*.gno.gen.go`) files.

## Contributing

We welcome your contributions and thank you for working to improve the Gnolang
development experience in VS Code.

## License

[MIT](LICENSE)
