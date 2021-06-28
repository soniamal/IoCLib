//utliziing jest test suite to run testing 

//from CueSheet functionality 
async function save (session) {
    await session.save()
  }
  
async function edit (session) {
    await session.clickButtonAndWait()
  }


  const timeout = (50 * 1000)
  jest.setTimeout(timeout)
  
  describe('MusicForce CueSheet', () => {
    let session
  
    beforeAll(async () => {
      page.setDefaultNavigationTimeout(timeout)
      page.setDefaultTimeout(timeout)
      session = await startUp()
      page = session.page
    })
  
    afterAll(async () => {
      // await session.close()
    })

    it('should save added song', async () => {
        await save(session)
      })

      //skip this test
    it.skip("should allow to edit a cuesheet", async () => {

    })

    })



