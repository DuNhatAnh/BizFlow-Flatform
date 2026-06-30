import subprocess

def run_build():
    result = subprocess.run(['dotnet', 'build', 'c:\\Users\\nhata\\BizFlow-Flatform\\backend\\src\\BizFlow.WebApi'], capture_output=True, text=True)
    print("STDOUT:")
    print(result.stdout)
    print("STDERR:")
    print(result.stderr)

run_build()
