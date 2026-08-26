package sandbox

import (
	"fmt"
	"log"

	"github.com/dop251/goja"
	"github.com/evanw/esbuild/pkg/api"
)

// Sandbox defines an isolated JS runtime for extensions
type Sandbox struct {
	vm *goja.Runtime
}

// NewSandbox creates a new Sandbox instance with standard APIs injected
func NewSandbox() *Sandbox {
	vm := goja.New()
	
	// Inject basic logging API
	vm.Set("log", func(msg string) {
		log.Println("[Plugin Log]:", msg)
	})
	
	// Example injection: db queries
	vm.Set("query", func(sql string) interface{} {
		// In a real app, this would execute secure SQL
		return fmt.Sprintf("Mock result for: %s", sql)
	})

	return &Sandbox{
		vm: vm,
	}
}

// RunExtension compiles modern JS/TS to ES5 and executes it in the Goja Sandbox
func (s *Sandbox) RunExtension(code string, isTypeScript bool) (goja.Value, error) {
	loader := api.LoaderJS
	if isTypeScript {
		loader = api.LoaderTS
	}

	// 1. Compile modern JS/TS to ES5
	result := api.Transform(code, api.TransformOptions{
		Loader: loader,
		Target: api.ES5,
	})

	if len(result.Errors) > 0 {
		return nil, fmt.Errorf("compile error: %s", result.Errors[0].Text)
	}

	// 2. Execute compiled code
	return s.vm.RunString(string(result.JS))
}
