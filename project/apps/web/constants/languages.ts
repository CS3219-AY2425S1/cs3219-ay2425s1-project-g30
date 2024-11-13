export enum LANGUAGES {
  JavaScript = 'javascript',
  Python = 'python',
  Java = 'java',
  Go = 'go',
  Ruby = 'ruby',
  PHP = 'php',
  Rust = 'rust',
}

export interface Runtime {
  language: LANGUAGES;
  version: string;
}

// This flag is used to get the output of the code execution
export const RESULT_FLAG = '__RESULT_FLAG__';

export const EXECUTION_TEMPLATES: Record<
  LANGUAGES,
  (code: string, inputs: string) => string
> = {
  [LANGUAGES.JavaScript]: (code, inputs) => `
${code}

try {
  if (typeof solution === 'function') {
    const output = solution(${inputs});
    console.log('${RESULT_FLAG}', output);
  } else {
    console.log('${RESULT_FLAG} undefined');
  }
} catch (e) {
  console.log('${RESULT_FLAG} Error:', e.message);
}
`,

  [LANGUAGES.Python]: (code, inputs) => `
${code}

try:
    output = solution(${inputs})
    print('${RESULT_FLAG}', output)
except NameError:
    print('${RESULT_FLAG} undefined')
except Exception as e:
    print('${RESULT_FLAG} Error:', str(e))
`,

  [LANGUAGES.Java]: (code, inputs) => `
public class Main {
  ${code}

  public static void main(String[] args) {
    try {
      int output = solution(${inputs});
      System.out.println("${RESULT_FLAG} " + output);
    } catch (Exception e) {
      System.out.println("${RESULT_FLAG} Error: " + e.getMessage());
    }
  }
}
`,

  [LANGUAGES.Go]: (code, inputs) => `
package main

import "fmt"

${code}

func main() {
  defer func() {
    if r := recover(); r != nil {
      fmt.Println("${RESULT_FLAG} undefined")
    }
  }()
  
  output := solution(${inputs})
  fmt.Println("${RESULT_FLAG}", output)
}
`,

  [LANGUAGES.Ruby]: (code, inputs) => `
${code}

begin
  if defined?(solution)
    puts "${RESULT_FLAG} \#{solution(${inputs})}"
  else
    puts "${RESULT_FLAG} undefined"
  end
rescue => e
  puts "${RESULT_FLAG} Error: \#{e.message}"
end
`,

  [LANGUAGES.PHP]: (code, inputs) => `
${code}

if (function_exists('solution')) {
  $output = solution(${inputs});
  echo "${RESULT_FLAG} " . $output . "\\n";
} else {
  echo "${RESULT_FLAG} undefined\\n";
}
`,

  [LANGUAGES.Rust]: (code, inputs) => `
${code}

fn main() {
  let result = std::panic::catch_unwind(|| {
    solution(${inputs})
  });

  match result {
    Ok(output) => println!("${RESULT_FLAG} {}", output),
    Err(_) => println!("${RESULT_FLAG} undefined"),
  }
}
`,
};
