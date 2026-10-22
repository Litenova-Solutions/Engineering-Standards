namespace Library.Integration.Tests.Lending.Copies.RegisterCopy;

public sealed class RegisterCopyTests(LibraryApiFixture api) : IClassFixture<LibraryApiFixture>
{
    /// <proves>scenario/register-copy.registering-a-new-copy-succeeds</proves>
    [Fact]
    public async Task A_new_copy_is_registered_through_a_helper_of_the_world()
    {
        var world = new CopyWorld(api);

        var registered = await world.RegisterAsync("The Name of the Rose");

        Assert.NotEqual(Guid.Empty, registered.CopyId);
    }

    private sealed class CopyWorld(LibraryApiFixture api)
    {
        public Task<RegisterCopyCommandResult> RegisterAsync(string title)
        {
            return api.Commands.SendAsync(new RegisterCopyCommand { Title = title });
        }
    }
}
